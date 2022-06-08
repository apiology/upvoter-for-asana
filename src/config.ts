export default abstract class Config {
  abstract fetchAsanaAccessToken(): Promise<string>;

  abstract fetchWorkspaceName(): Promise<string>;
  // abstract fetchSomeConfigItem(): Promise<string>;
}
