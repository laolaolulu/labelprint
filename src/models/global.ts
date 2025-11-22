// 全局共享数据示例
import { DEFAULT_NAME } from '@/constants';
import { useState } from 'react';

export default () => {
  const [name, setName] = useState<string>(DEFAULT_NAME);

  // const [selectTemplate, setSelectTemplate] = useState<string>();

  // useEffect(() => {
  //   const template = localStorage.getItem('selectTemplate');
  //   if (template) {
  //     setSelectTemplate(template);
  //   }
  // }, []);

  // /**选择打印模板 */
  // const setSelectTem = (template?: string) => {
  //   if (template) {
  //     localStorage.setItem('selectTemplate', template);
  //   } else {
  //     localStorage.removeItem('selectTemplate');
  //   }
  //   setSelectTemplate(template);
  // };

  return {
    name,
    setName,
    // selectTemplate,
    // setSelectTem,
  };
};
