// 运行时配置

export const layout = () => {
  return {
    logo: 'favicon.svg',
    menu: {
      locale: false,
    },
    layout: 'top',
    token: {
      pageContainer: {
        paddingBlockPageContainerContent: 0,
        paddingInlinePageContainerContent: 0,
      },
    },
  };
};
