import * as React from "react";
import {PropsRatingBar, RatingBar} from "./RatingBar";

const Template = (args) => {
    const [stars, setStars] = React.useState(args.value);
    return <RatingBar value={stars} setValue={v => setStars(v)} />
}

export const Default = Template.bind({})

Default.args = {
    value: 2,
}

export default {
    title: 'Storybook demo/RatingBar',
    component: RatingBar,
};