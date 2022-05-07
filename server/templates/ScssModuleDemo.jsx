import * as React from "react";
import styles from "./ScssModuleDemo.module.scss";

export const ScssModuleDemo = () => (
  <div className={styles.hello}>
    <div>SCSS Module demo</div>
  </div>
);
