import MyModalForm from '@/components/MyModalForm';
import {
  DownloadOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FileSyncOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  PrinterOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { ProFormText } from '@ant-design/pro-components';
import { getDefaultFont, Template } from '@pdfme/common';
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
  Modal,
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
  const creTemNameRef = useRef<any>(undefined); //输入模板名称 弹窗控制
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
        font: {
          ...getDefaultFont(),
          普惠体: {
            data: `${window.location.origin}/font/AlibabaPuHuiTi-3-55-Regular.ttf`,
            // fallback: true,
            subset: true,
          },
          普惠粗体: {
            data: `${window.location.origin}/font/AlibabaPuHuiTi-3-85-Bold.ttf`,
            subset: true,
          },
          思源黑体: {
            data: `${window.location.origin}/font/SourceHanSansCN-VF.ttf`,
            subset: true,
          },
          思源宋体: {
            data: `${window.location.origin}/font/SourceHanSerifCN-VF.ttf`,
            subset: true,
          },
        },
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
  const temChange = useMemo(
    () => JSON.stringify(newTemplate) === JSON.stringify(defTemplate),
    [newTemplate],
  );

  //#region 保存编辑的模板
  const SaveTemplate = useCallback(
    (filename: string) => {
      templates!.dir
        .getFileHandle(filename, {
          create: true,
        })
        .then((fileHandle) => fileHandle.createWritable())
        .then((writable) => {
          writable.write(JSON.stringify(newTemplate));
          writable.close();
          defTemplate = newTemplate;
          setNewTemplate({ ...newTemplate }); //为了刷新保存按钮是否可用
        });
    },
    [templates, newTemplate],
  );
  //#endregion

  //切换显示模板
  useEffect(() => {
    templates?.files
      .find((f) => f.name === selectTemplate)
      ?.text()
      .then((txt) => {
        defTemplate = JSON.parse(txt);
        designerRef.current?.updateTemplate(defTemplate);
      });

    if (!temChange && selectTemplate) {
      //当前模板存在编辑
      Modal.confirm({
        title: '当前模板已修改暂未保存',
        icon: <ExclamationCircleOutlined />,
        content:
          '点击【确认】保存当前模板编辑；点击【取消】忽略丢弃当前模板的编辑项',

        onOk() {
          SaveTemplate(selectTemplate);
        },
      });
    }
  }, [selectTemplate]);

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
                  key: 'export',
                  icon: <DownloadOutlined />,
                  disabled: !selectTemplate,
                  label: '导出',
                },
                {
                  type: 'divider',
                },
                {
                  key: 'reset',
                  icon: <FileSyncOutlined />,
                  disabled: temChange,
                  title: '丢弃模板编辑项',
                  label: '重置',
                },
              ],
              onClick: async (info) => {
                switch (info.key) {
                  case 'reset':
                    {
                      setNewTemplate(defTemplate);
                      designerRef.current?.updateTemplate(defTemplate);
                    }
                    break;
                  case 'export':
                    {
                      // 选择目录
                      const directoryHandle =
                        await window.showDirectoryPicker();
                      const fileHandle = await directoryHandle.getFileHandle(
                        selectTemplate!,
                        {
                          create: true,
                        },
                      );
                      // 创建可写流
                      const writable = await fileHandle.createWritable();

                      // 将 File 对象写入
                      await writable.write(
                        templates!.files.find(
                          (f) => f.name === selectTemplate,
                        )!,
                      );

                      await writable.close();
                    }
                    break;

                  default:
                    break;
                }
              },
            }}
            buttonsRender={([, rightButton]) => [
              <Button
                key="save"
                icon={<SaveOutlined />}
                disabled={temChange}
                onClick={async () => {
                  if (selectTemplate) {
                    SaveTemplate(selectTemplate);
                  } else {
                    if (!templates) {
                      await SelectDir();
                      await message.loading({ content: '', duration: 0.5 });
                    }
                    //创建名称
                    const res = await creTemNameRef.current.open();
                    if (res) {
                      SaveTemplate(res.name);
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
          <Divider orientation="vertical" />
          模板:
          <Select
            onChange={(val) => {
              setSelectTem(val);
            }}
            //defaultValue={selectTemplate}
            value={selectTemplate}
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
                  case 'empty':
                    defTemplate = {
                      basePdf: {
                        width: 150,
                        height: 100,
                        padding: [0, 0, 0, 0],
                      },
                      schemas: [[]],
                    };
                    setSelectTem(null);
                    //  setNewTemplate(defTemplate);
                    designerRef.current?.updateTemplate(defTemplate);
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
              iconPlacement="end"
            >
              新建
              <FolderAddOutlined />
            </Button>
          </Dropdown>
          <Divider orientation="vertical" />
          尺寸
          <Space.Compact block>
            {['width', 'height'].map((m) => (
              <InputNumber
                min={1}
                max={999}
                key={m}
                placeholder={m}
                style={{ width: 50 }}
                defaultValue={(defTemplate.basePdf as any)[m]}
                controls={false}
                onBlur={(e) => {
                  (newTemplate.basePdf as any)[m] = Number(e.target.value);
                  designerRef.current?.updateTemplate(newTemplate);
                }}
              />
            ))}
          </Space.Compact>
          <Typography.Text type="secondary">mm</Typography.Text>
          <Divider orientation="vertical" />
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
