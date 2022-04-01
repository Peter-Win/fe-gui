import * as React from "react";
import styles from "./CssModuleDemo.module.css";

export const CssModuleDemo = () => (
  <div className={styles.hello}>
    <div>CSS Module demo</div>
  </div>
);
