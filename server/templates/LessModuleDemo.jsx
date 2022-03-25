import * as React from "react";
import styles from "./LessModuleDemo.module.less";

export const LessModuleDemo = () => (
  <div className={styles.hello}>
    <div>LESS Module demo</div>
  </div>
);
