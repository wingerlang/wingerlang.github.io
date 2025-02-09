export interface WingerConfig {
  VIEW_NAME: string;
  CONTROLLER_NAME: string;
}
export const defaultWingerConfig: WingerConfig = {
  VIEW_NAME: "view", // TODO: add 'modes'
  CONTROLLER_NAME: "controller",
};
