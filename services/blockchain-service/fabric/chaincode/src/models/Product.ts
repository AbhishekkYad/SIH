import { Object, Property } from 'fabric-contract-api';

@Object()
export class Product {
    @Property()
    public readonly docType: string = 'product';

    @Property()
    public product_id: string;

    @Property()
    public name: string;

    @Property()
    public product_type: string;

    @Property()
    public created_by_org: string;

    @Property()
    public created_at: string;

    constructor(
        product_id: string,
        name: string,
        product_type: string,
        created_by_org: string,
        created_at: string
    ) {
        this.product_id = product_id;
        this.name = name;
        this.product_type = product_type;
        this.created_by_org = created_by_org;
        this.created_at = created_at;
    }
}
