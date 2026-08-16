import os
import glob

def replace_in_file(filepath, old, new):
    with open(filepath, 'r') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(filepath, 'w') as f:
            f.write(content)

test_files = glob.glob(r'c:\Users\ACER NITRO V 15\OneDrive\Desktop\CODING\SIH\services\application-service\tests\*.py')

for f in test_files:
    replace_in_file(f, 'batch-orange-001', 'batch-apple-001')
    replace_in_file(f, 'prd-orange-001', 'prd-apple-001')

print("Replaced orange with apple in tests")
