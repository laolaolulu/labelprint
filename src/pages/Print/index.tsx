import MyModalForm from '@/components/MyModalForm';
import {
  DownOutlined,
  FileOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  PrinterOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { ProFormText } from '@ant-design/pro-components';
import { Template } from '@pdfme/common';
import {
  barcodes,
  dateTime,
  ellipse,
  image,
  line,
  multiVariableText,
  rectangle,
  table,
  text,
} from '@pdfme/schemas';
import { Designer } from '@pdfme/ui';
import { useIntl, useModel } from '@umijs/max';
import {
  Button,
  Divider,
  Dropdown,
  Flex,
  InputNumber,
  message,
  Select,
  Space,
  Typography,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 默认模板
let defTemplate: Template = {
  basePdf: {
    width: 150,
    height: 100,
    padding: [0, 0, 0, 0],
  },
  schemas: [[]],
};

export default () => {
  const intl = useIntl(); //语言国际化
  const creTemNameRef = useRef<any>(); //输入模板名称 弹窗控制
  const designerRef = useRef<Designer | null>(null); //设计器UI
  const [newTemplate, setNewTemplate] = useState(defTemplate); //设计器修改模板
  const { templates, setDir, selectTemplate, setSelectTem } =
    useModel('settings');

  //#region 授权设置修改打印模板存放目录
  const SelectDir = useCallback(async () => {
    message.info('请选择并授权加载打印模板的目录');
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });
    setDir('templates', dirHandle);
  }, [setDir]);
  //#endregion

  //#region 初始化Designer设计器
  useEffect(() => {
    designerRef.current = new Designer({
      domContainer: document.getElementById('container')!,
      template: defTemplate,
      plugins: {
        text,
        multiVariableText,
        table,
        line,
        rectangle,
        ellipse,
        image,
        qrcode: barcodes.qrcode,
        barcodes: barcodes.code128,
        dateTime,
      },
      options: {
        zoomLevel: 1, // 初始缩放级别
        sidebarOpen: true,
        lang: intl.locale.split('-')[0] as any,
        // font: {
        //   // serif: {
        //   //   data: 'Microsoft YaHei',
        //   //   fallback: true,
        //   // },
        // },
      },
    });
    designerRef.current.onChangeTemplate((t) => {
      setNewTemplate(t);
    });
    // 清理函数
    return () => {
      designerRef.current?.destroy();
    };
  }, []);
  //#endregion

  //切换显示模板
  useEffect(() => {
    templates?.files
      .find((f) => f.name == selectTemplate)
      ?.text()
      .then((txt) => {
        defTemplate = JSON.parse(txt);
        designerRef.current?.updateTemplate(defTemplate);
      });
  }, [selectTemplate]);

  const temChange = useMemo(
    () => JSON.stringify(newTemplate) === JSON.stringify(defTemplate),
    [newTemplate],
  );

  return (
    <>
      <Flex justify="space-between" style={{ margin: 10 }}>
        <Space>
          <Dropdown.Button
            // type="primary"
            icon={<DownOutlined />}
            menu={{
              items: [
                {
                  key: '1',
                  label: (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.antgroup.com"
                    >
                      导出
                    </a>
                  ),
                },
                {
                  type: 'divider',
                },
                {
                  key: '12',
                  label: (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.antgroup.com"
                    >
                      重置
                    </a>
                  ),
                },
              ],
            }}
            buttonsRender={([_, rightButton]) => [
              <Button
                icon={<SaveOutlined />}
                disabled={temChange}
                onClick={async () => {
                  if (selectTemplate) {
                  } else {
                    if (!templates) {
                      await SelectDir();
                      await message.loading({ content: '', duration: 0.5 });
                    }
                    //创建名称
                    const res = await creTemNameRef.current.open();
                    if (res) {
                      // 2. 创建新文件
                      const fileHandle = await templates!.dir.getFileHandle(
                        res.name,
                        {
                          create: true,
                        },
                      );
                      // 3. 获取可写流
                      const writable = await fileHandle.createWritable();
                      // 4. 写入内容
                      await writable.write(JSON.stringify(newTemplate));
                      await writable.close();
                    } else {
                      message.error('未命名，取消保存');
                    }
                  }
                }}
              >
                {/* {temChange ? '' : '* '} */}
                保存
              </Button>,
              rightButton,
            ]}
          />
          <Divider type="vertical" />
          模板:
          <Select
            onChange={(val) => {
              setSelectTem(val);
            }}
            defaultValue={selectTemplate}
            style={{ width: 200 }}
            options={templates?.files.map((m) => ({ value: m.name }))}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'empty',
                  label: '从空白页',
                  icon: <FileOutlined />,
                },
                {
                  key: '2',
                  label: (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.antgroup.com"
                    >
                      从当前模板
                    </a>
                  ),
                },
                {
                  key: '3',
                  label: (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.antgroup.com"
                    >
                      导入
                    </a>
                  ),
                },
                {
                  key: 'read',
                  icon: <FolderOpenOutlined />,
                  label: (
                    <>
                      读取
                      {templates ? (
                        <Typography.Text
                          type="secondary"
                          style={{ marginLeft: 10 }}
                        >
                          {templates.dir.name}
                        </Typography.Text>
                      ) : (
                        <Typography.Text
                          type="warning"
                          style={{ marginLeft: 10 }}
                        >
                          未授权
                        </Typography.Text>
                      )}
                    </>
                  ),
                },
                {
                  type: 'divider',
                },
                {
                  key: '4',
                  label: (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.antgroup.com"
                    >
                      删除
                    </a>
                  ),
                },
              ],
              onClick: async (info) => {
                switch (info.key) {
                  case 'read':
                    SelectDir();
                    break;

                  default:
                    break;
                }
              },
            }}
          >
            <Button
              //  type="primary"
              icon={<DownOutlined />}
              onClick={(e) => e.preventDefault()}
              iconPosition="end"
            >
              新建
              <FolderAddOutlined />
            </Button>
          </Dropdown>
          <Divider type="vertical" />
          尺寸
          <Space.Compact block>
            {['width', 'height'].map((m) => (
              <InputNumber
                min={1}
                max={999}
                placeholder={m}
                style={{ width: 50 }}
                defaultValue={defTemplate.basePdf[m]}
                controls={false}
                onBlur={(e) => {
                  newTemplate.basePdf[m] = Number(e.target.value);
                  designerRef.current?.updateTemplate(newTemplate);
                }}
              />
            ))}
          </Space.Compact>
          <Typography.Text type="secondary">mm</Typography.Text>
          <Divider type="vertical" />
        </Space>
        <Space>
          <Button icon={<PrinterOutlined />}>打印</Button>
        </Space>
      </Flex>
      <div id="container" style={{ height: 'calc(100vh - 108.2px)' }} />
      <MyModalForm ref={creTemNameRef} title="新建打印模板">
        <ProFormText
          name="name"
          label="模板名称"
          placeholder="请输入新建模板名称"
        />
      </MyModalForm>
    </>
  );
};
