import { IPaymentGateway } from '../../domain/ports/IPaymentGateway';

export class MockPaymentGateway implements IPaymentGateway {
  async charge(customerId: string, amount: number): Promise<boolean> {
    // Simulate a successful charge
    console.log(`Mocking charge of ${amount} for customer ${customerId}`);
    return true;
  }
}
