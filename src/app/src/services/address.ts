import { httpsCallable, Functions } from "firebase/functions";

export interface Address {
  id?: string;
  uid: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  label?: string;
  updatedAt?: Date;
}

export class AddressService {
  private functions: Functions;

  constructor(functions: Functions) {
    this.functions = functions;
  }

  /**
   * Save address for the user
   */
  async saveAddress(address: Address): Promise<Address> {
    try {
      const saveAddressFunction = httpsCallable(this.functions, "saveAddress");
      const result = await saveAddressFunction({
        uid: address.uid,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        phone: address.phone || "",
        label: address.label || "Home",
      });

      const data = result.data as any;
      return {
        uid: address.uid,
        ...data.address,
      };
    } catch (error: any) {
      console.error("Save address failed:", error);
      throw new Error(error.message || "Failed to save address");
    }
  }

  /**
   * Get all addresses for the user
   */
  async getAddresses(uid: string): Promise<Address[]> {
    try {
      const getAddressesFunction = httpsCallable(this.functions, "getAddresses");
      const result = await getAddressesFunction({ uid });

      const data = result.data as any;
      return data.addresses || [];
    } catch (error: any) {
      console.error("Get addresses failed:", error);
      throw new Error(error.message || "Failed to fetch addresses");
    }
  }

  /**
   * Update an existing address
   */
  async updateAddress(address: Address): Promise<Address> {
    try {
      if (!address.id) {
        throw new Error("Address ID is required for update");
      }

      const updateAddressFunction = httpsCallable(this.functions, "updateAddress");
      const result = await updateAddressFunction({
        uid: address.uid,
        addressId: address.id,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        phone: address.phone || "",
        label: address.label || "Home",
      });

      const data = result.data as any;
      return {
        id: address.id,
        uid: address.uid,
        ...data.address,
      };
    } catch (error: any) {
      console.error("Update address failed:", error);
      throw new Error(error.message || "Failed to update address");
    }
  }

  /**
   * Delete an address
   */
  async deleteAddress(uid: string, addressId: string): Promise<void> {
    try {
      const deleteAddressFunction = httpsCallable(this.functions, "deleteAddress");
      await deleteAddressFunction({
        uid,
        addressId,
      });
    } catch (error: any) {
      console.error("Delete address failed:", error);
      throw new Error(error.message || "Failed to delete address");
    }
  }
}
