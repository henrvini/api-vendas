import AppError from "@shared/errors/AppError";
import { getCustomRepository } from "typeorm";
import { OrdersRepository } from "../typeorm/repositories/OrdersRepository";
import Order from "../typeorm/entities/Order";
import CustomersRepository from "@modules/customers/typeorm/repositories/CustomersRepository";
import ProductsRepository from "@modules/products/typeorm/repositories/ProductsRepository";

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

class CreateOrderService {
  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const ordersRepository = getCustomRepository(OrdersRepository);
    const customerRepository = getCustomRepository(CustomersRepository);
    const productsRepository = getCustomRepository(ProductsRepository);

    const customerExists = await customerRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError("Customer not found");
    }

    const productsExists = await productsRepository.findAllByIds(products);

    if (!productsExists.length) {
      throw new AppError("Product not found");
    }

    const productsIdsExists = productsExists.map(product => product.id);

    const checkInexistentProducts = products.filter(
      product => !productsIdsExists.includes(product.id),
    );

    if (checkInexistentProducts.length) {
      throw new AppError(`Inexistent product ${checkInexistentProducts[0].id}`);
    }

    const quantityAvailable = products.filter(
      product =>
        productsExists.filter(
          productFilter => productFilter.id === product.id,
        )[0].quantity < product.quantity,
    );

    if (quantityAvailable.length) {
      throw new AppError(
        `The quantity ${quantityAvailable[0].quantity} is not available for ${quantityAvailable[0].id}`,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: productsExists.filter(
        productFilter => productFilter.id === product.id,
      )[0].price,
    }));

    const order = await ordersRepository.createOrder({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const updatedProductQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        productsExists.filter(
          productFilter => productFilter.id === product.product_id,
        )[0].quantity - product.quantity,
    }));

    await productsRepository.save(updatedProductQuantity);

    return order;
  }
}

export default CreateOrderService;
