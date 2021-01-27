export default class SuccessFactors {
  async login(): Promise<boolean> {
    console.log('Mock Successfactors: login was called');
    return true;
  }

  logout() {
    console.log('Mock Successfactors: logout was called');
  }

  async checkLogin(): Promise<boolean> {
    console.log('Mock Successfactors: checkLogin was called');
    return true;
  }

  async downloadProfileImagesToFolder(): Promise<void> {
    console.log('Mock Successfactors: downloadProfileImagesToFolder was called');
  }
}
