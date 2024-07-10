import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';

type Story = StoryObj<typeof Button>;

Button.displayName = 'Button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Click Me',
  },
};

export default meta;

export const Default: Story = {
  render: (args) => {
    return <Button {...args} />;
  },
};
