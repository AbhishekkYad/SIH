from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.product import Product

class ProductRepository:
    @staticmethod
    async def create(db: AsyncSession, product_id, name: str, product_type: str, category: str = None) -> Product:
        product = Product(
            product_id=product_id,
            name=name,
            product_type=product_type,
            category=category
        )
        db.add(product)
        await db.flush()  # flushes changes to transaction without committing
        return product

    @staticmethod
    async def get_by_id(db: AsyncSession, product_id) -> Product | None:
        result = await db.execute(select(Product).where(Product.product_id == product_id))
        return result.scalar_one_or_none()
