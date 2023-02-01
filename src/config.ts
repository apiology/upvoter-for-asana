export abstract class Config {
  abstract fetchAsanaAccessToken(): Promise<string>;

  abstract fetchWorkspaceName(): Promise<string>;

  abstract fetchCustomFieldName(): Promise<string>;

  abstract fetchIncrement(): Promise<boolean>;

  abstract fetchManualIncrementAmount(): Promise<number>;

  validate = async (): Promise<void> => {
    await this.fetchAsanaAccessToken();
    await this.fetchWorkspaceName();
    await this.fetchCustomFieldName();
    await this.fetchIncrement();
    await this.fetchManualIncrementAmount();
  }
}
