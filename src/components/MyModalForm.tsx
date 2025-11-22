import { ModalForm } from '@ant-design/pro-components';
import { forwardRef, ReactNode, useImperativeHandle, useState } from 'react';
let myresolve: (value: any) => void;
export default forwardRef(
  (props: { children: ReactNode; title: string; width?: number }, ref) => {
    const [open, setOpen] = useState(false);
    const { children, title, width = 400 } = props;
    useImperativeHandle(ref, () => ({
      open: async () => {
        setOpen(true);
        const res = await new Promise<any>((resolve) => {
          myresolve = resolve;
        });
        setOpen(false);
        return res;
      },
    }));
    return (
      <ModalForm
        title={title}
        layout="horizontal"
        style={{ paddingTop: 20 }}
        width={width}
        open={open}
        onFinish={async (val) => {
          myresolve(val);
        }}
        modalProps={{
          maskClosable: false,
          destroyOnHidden: true,
          onCancel: () => {
            myresolve(undefined);
          },
        }}
      >
        {children}
      </ModalForm>
    );
  },
);
