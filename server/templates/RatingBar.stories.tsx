import * as React from "react";
import { Story, Meta } from "@storybook/react";
import { PropsRatingBar, RatingBar } from "./RatingBar";

const Template: Story<PropsRatingBar> = ({ value }: PropsRatingBar) => {
  const [stars, setStars] = React.useState(value);
  return <RatingBar value={stars} setValue={(v) => setStars(v)} />;
};

export const Default = Template.bind({});

Default.args = {
  value: 2,
};

export default {
  title: "Storybook demo/RatingBar",
  component: RatingBar,
} as Meta;
