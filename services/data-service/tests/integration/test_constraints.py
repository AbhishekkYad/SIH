import uuid
import pytest
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.models.identity import Organization, User
from app.models.product import Product
from app.models.event import Event

@pytest.mark.asyncio
async def test_database_unique_constraints(db_session):
    """
    Verifies that unique constraints (like duplicate product_id or fabric_tx_id)
    raise raw database-level IntegrityErrors upon flush.
    """
    product_id = uuid.uuid4()
    p1 = Product(product_id=product_id, name="Milk A", product_type="DAIRY")
    p2 = Product(product_id=product_id, name="Milk B", product_type="DAIRY")

    db_session.add(p1)
    await db_session.flush()

    db_session.add(p2)
    with pytest.raises(IntegrityError):
        await db_session.flush()

    # Clear transaction state so session stays usable
    await db_session.rollback()


@pytest.mark.asyncio
async def test_database_foreign_key_constraints(db_session):
    """
    Verifies that foreign key violations (like invalid organization_id)
    are strictly rejected by the database engine.
    """
    bad_org_id = uuid.uuid4()
    user = User(
        user_id=uuid.uuid4(),
        organization_id=bad_org_id, # org does not exist
        role_id="OPERATOR",
        auth_subject="auth-subject-bad-fk",
        status="ACTIVE"
    )
    db_session.add(user)
    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_transaction_rollback_atomicity(db_session):
    """
    Verifies ACID rollback behavior. If a multi-step database operation
    encounters a failure halfway, all inserted entities must be reverted.
    """
    # 1. Create a valid product
    product_id = uuid.uuid4()
    product = Product(product_id=product_id, name="Atomic Product", product_type="MEAT")
    db_session.add(product)
    await db_session.flush()

    # Verify product exists in session transactions
    res = await db_session.execute(select(Product).where(Product.product_id == product_id))
    assert res.scalar_one_or_none() is not None

    # 2. Add an invalid entity that will fail constraint check
    bad_user = User(
        user_id=uuid.uuid4(),
        organization_id=uuid.uuid4(), # invalid FK
        role_id="OPERATOR",
        auth_subject="auth-subject-atomic-fail"
    )
    db_session.add(bad_user)

    # 3. Flush/commit triggers error and forces rollback
    try:
        await db_session.commit()
        raise AssertionError("Commit should have failed due to foreign key constraint violation.")
    except IntegrityError:
        # Expected failure: database rules force transaction abort
        await db_session.rollback()

    # 4. Verify that the valid Product was ALSO rolled back completely
    # Create a fresh database execution read
    res2 = await db_session.execute(select(Product).where(Product.product_id == product_id))
    assert res2.scalar_one_or_none() is None
