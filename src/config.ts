export default abstract class Config {
  abstract fetchAsanaAccessToken(): Promise<string>;

  abstract fetchWorkspaceName(): Promise<string>;

  abstract fetchCustomFieldName(): Promise<string>;

  abstract fetchIncrement(): Promise<boolean>;

  abstract fetchManualIncrementAmount(): Promise<number>;
}
