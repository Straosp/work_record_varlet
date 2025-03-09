export interface User {
  id: number;
  username: string;
  phone: string;
  status: number;
}

export interface WorkRecord {
  id:                      number;
  teamSize:                number;
  singleProductQuantity:   number;
  singleProductPrice:      number;
  multipleProductQuantity: number;
  multipleProductPrice:    number;
  workDate:                Date;
  accountId:               number;
}