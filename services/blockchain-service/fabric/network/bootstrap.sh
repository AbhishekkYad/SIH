#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SIH 2026 — Fabric Network Bootstrap Script
# Generates crypto material, creates channel artifacts, starts
# the network, creates the channel, and deploys chaincode.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NETWORK_DIR="${SCRIPT_DIR}"
CHAINCODE_DIR="${SCRIPT_DIR}/../chaincode"
CHANNEL_NAME="tracechannel"
CHAINCODE_NAME="traceability"
CC_VERSION="1.0"
CC_SEQUENCE=1

echo "═══════════════════════════════════════════════════════════"
echo "  SIH 2026 — Fabric Network Bootstrap"
echo "═══════════════════════════════════════════════════════════"

# ── Step 1: Generate Crypto Material ──────────────────────────
echo ""
echo "[1/6] Generating cryptographic material..."
if [ -d "${NETWORK_DIR}/crypto-config" ]; then
    echo "  Crypto material already exists. Skipping."
else
    cryptogen generate --config="${NETWORK_DIR}/crypto-config.yaml" --output="${NETWORK_DIR}/crypto-config"
    echo "  ✓ Crypto material generated."
fi

# ── Step 2: Generate Channel Artifacts ────────────────────────
echo ""
echo "[2/6] Generating channel artifacts..."
mkdir -p "${NETWORK_DIR}/channel-artifacts"

export FABRIC_CFG_PATH="${NETWORK_DIR}"

configtxgen -profile TraceOrdererGenesis -channelID system-channel -outputBlock "${NETWORK_DIR}/channel-artifacts/genesis.block"
echo "  ✓ Genesis block created."

configtxgen -profile TraceChannel -outputCreateChannelTx "${NETWORK_DIR}/channel-artifacts/${CHANNEL_NAME}.tx" -channelID "${CHANNEL_NAME}"
echo "  ✓ Channel transaction created."

# Anchor peer updates
configtxgen -profile TraceChannel -outputAnchorPeersUpdate "${NETWORK_DIR}/channel-artifacts/Org1MSPanchors.tx" -channelID "${CHANNEL_NAME}" -asOrg Org1MSP
configtxgen -profile TraceChannel -outputAnchorPeersUpdate "${NETWORK_DIR}/channel-artifacts/Org2MSPanchors.tx" -channelID "${CHANNEL_NAME}" -asOrg Org2MSP
echo "  ✓ Anchor peer updates created."

# ── Step 3: Start Network ────────────────────────────────────
echo ""
echo "[3/6] Starting Fabric network containers..."
docker-compose -f "${NETWORK_DIR}/docker-compose-fabric.yml" up -d
echo "  ✓ Network containers started."

echo "  Waiting for nodes to initialize..."
sleep 10

# ── Step 4: Create and Join Channel ──────────────────────────
echo ""
echo "[4/6] Creating channel '${CHANNEL_NAME}'..."

# Create channel using osnadmin (Fabric 2.5 channel participation)
export ORDERER_CA="${NETWORK_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
export ORDERER_ADMIN_TLS_SIGN_CERT="${NETWORK_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
export ORDERER_ADMIN_TLS_PRIVATE_KEY="${NETWORK_DIR}/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

osnadmin channel join \
  --channelID "${CHANNEL_NAME}" \
  --config-block "${NETWORK_DIR}/channel-artifacts/genesis.block" \
  -o localhost:7053 \
  --ca-file "${ORDERER_CA}" \
  --client-cert "${ORDERER_ADMIN_TLS_SIGN_CERT}" \
  --client-key "${ORDERER_ADMIN_TLS_PRIVATE_KEY}"

echo "  ✓ Orderer joined channel."

# Org1 peer joins
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

peer channel join -b "${NETWORK_DIR}/channel-artifacts/genesis.block"
echo "  ✓ Org1 peer joined channel."

# Org2 peer joins
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_DIR}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
export CORE_PEER_ADDRESS=localhost:9051

peer channel join -b "${NETWORK_DIR}/channel-artifacts/genesis.block"
echo "  ✓ Org2 peer joined channel."

# ── Step 5: Package & Install Chaincode ──────────────────────
echo ""
echo "[5/6] Packaging and installing chaincode..."

# Build chaincode
cd "${CHAINCODE_DIR}"
npm install
npm run build
cd "${NETWORK_DIR}"

# Package chaincode
peer lifecycle chaincode package "${CHAINCODE_NAME}.tar.gz" \
  --path "${CHAINCODE_DIR}" \
  --lang node \
  --label "${CHAINCODE_NAME}_${CC_VERSION}"

# Install on Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install "${CHAINCODE_NAME}.tar.gz"
echo "  ✓ Chaincode installed on Org1."

# Install on Org2
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_DIR}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install "${CHAINCODE_NAME}.tar.gz"
echo "  ✓ Chaincode installed on Org2."

# ── Step 6: Approve & Commit ─────────────────────────────────
echo ""
echo "[6/6] Approving and committing chaincode definition..."

# Get package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r '.installed_chaincodes[0].package_id')
echo "  Package ID: ${PACKAGE_ID}"

# Approve for Org2
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  --version "${CC_VERSION}" \
  --package-id "${PACKAGE_ID}" \
  --sequence ${CC_SEQUENCE} \
  --tls \
  --cafile "${ORDERER_CA}"
echo "  ✓ Org2 approved chaincode."

# Approve for Org1
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode approveformyorg \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  --version "${CC_VERSION}" \
  --package-id "${PACKAGE_ID}" \
  --sequence ${CC_SEQUENCE} \
  --tls \
  --cafile "${ORDERER_CA}"
echo "  ✓ Org1 approved chaincode."

# Commit chaincode definition
peer lifecycle chaincode commit \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --channelID "${CHANNEL_NAME}" \
  --name "${CHAINCODE_NAME}" \
  --version "${CC_VERSION}" \
  --sequence ${CC_SEQUENCE} \
  --tls \
  --cafile "${ORDERER_CA}" \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${NETWORK_DIR}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${NETWORK_DIR}/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✓ Fabric network is UP and chaincode is COMMITTED."
echo "  Channel:    ${CHANNEL_NAME}"
echo "  Chaincode:  ${CHAINCODE_NAME} v${CC_VERSION}"
echo "  Org1 Peer:  localhost:7051"
echo "  Org2 Peer:  localhost:9051"
echo "  Orderer:    localhost:7050"
echo "═══════════════════════════════════════════════════════════"
