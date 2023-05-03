import { getCustomRepository } from "typeorm";
import { ProductsRepository } from "../typeorm/repositories/ProductsRepository";
import Product from "../typeorm/entities/Product";

interface IRequest {
  id: string;
}

class ShowProductService {
  public async execute({ id }: IRequest): Promise<Product | undefined> {
    const productsRepository = getCustomRepository(ProductsRepository);

    const product = productsRepository.findOne(id);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }
}

export default ShowProductService;
