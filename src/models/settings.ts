import { openDB } from 'idb';
import { useEffect, useState } from 'react';

export default () => {
  const [templates, setTemplates] = useState<{
    dir: FileSystemDirectoryHandle;
    files: File[];
  }>(); //打印模板目录
  const [printdir, setPrintdir] = useState<FileSystemDirectoryHandle>(); //打印文件目录（自动打印使用）
  const [selectTemplate, setSelectTemplate] = useState<string>(); //默认选择的打印模板名称

  useEffect(() => {
    const template = localStorage.getItem('selectTemplate');
    if (template) {
      setSelectTemplate(template);
    }

    openDB('my-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dirs')) {
          db.createObjectStore('dirs', { keyPath: 'id' });
        }
      },
    }).then(async (db) => {
      db.getAll('dirs').then((res) => {
        res.forEach((element) => {
          setDir(element.id, element.dir);
        });
      });
    });
  }, []);

  //#region 如果切换了模板读取目录后，想要校验下默认选中的模板是否再目录中存在，不存在置undefined
  useEffect(() => {
    if (templates && templates.files.length > 0) {
      if (templates.files.find((f) => f.name == selectTemplate)) {
        //  setSelectTem(selectTemplate);
      } else {
        setSelectTem(templates.files[0].name);
      }
    } else {
      setSelectTem(undefined);
    }
  }, [templates]);
  //#endregion

  const getFileByDir = async (dir: FileSystemDirectoryHandle) => {
    const files: File[] = [];
    for await (const entry of dir.values()) {
      if (entry.kind !== 'file') {
        continue;
      }
      const file = await entry.getFile();
      files.push(file);
    }

    setTemplates({ dir, files });
  };

  /**选择打印模板 */
  const setSelectTem = (template?: string | null) => {
    if (template === null) {
      setSelectTemplate(undefined);
    } else {
      if (template) {
        localStorage.setItem('selectTemplate', template);
      } else {
        localStorage.removeItem('selectTemplate');
      }
      setSelectTemplate(template);
    }
  };

  /**获取目录权限保存路径 */
  const setDir = async (id: string, dir: FileSystemDirectoryHandle) => {
    const db = await openDB('my-db', 1);
    db.put('dirs', { id, dir });
    if (id === 'templates') {
      getFileByDir(dir);
    } else if (id === 'printdir') {
      setPrintdir(dir);
    }
  };

  return {
    templates,
    printdir,
    setDir,
    selectTemplate,
    setSelectTem,
  };
};
