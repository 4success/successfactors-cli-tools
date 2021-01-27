export interface CommandsInterface {
  [key: string]: string;
}

export type SuccessFactorsBasicCredentials = {
  apiHost: string | null;
  username: string | null;
  companyId: string | null;
  password: string | null;
};
