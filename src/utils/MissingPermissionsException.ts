import t from './i18n';

export class MissingPermissionsException {
  constructor(public permissions: string[]) {}

  public toString() {
    return `${t("common.missingPermissions")} ${this.permissions.join(", ")}`;
  }
}