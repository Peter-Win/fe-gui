import * as React from "react";
import styles from "./SassModuleDemo.module.sass";

export const SassModuleDemo = () => (
  <div className={styles.hello}>
    <div>Sass Module demo</div>
  </div>
);
