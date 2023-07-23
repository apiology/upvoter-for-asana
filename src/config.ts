export abstract class Config {
  abstract fetchAsanaAccessToken(): Promise<string>;

  abstract fetchWorkspaceName(): Promise<string>;
  // abstract fetchSomeConfigItem(): Promise<string>;

  validate = async (): Promise<void> => {
    await this.fetchAsanaAccessToken();
    await this.fetchWorkspaceName();
    // await this.fetchSomeConfigItem();
  };
}
