/*
 * @Author: losting
 * @Date: 2022-04-01 16:05:12
 * @LastEditTime: 2022-05-12 11:57:47
 * @LastEditors: losting
 * @Description:
 * @FilePath: \rollup-template\src\index.ts
 */
import '@/styles/index.scss';
// 加法函数
export function add(...values: number[]): number {
  return values.reduce((pre, cur) => pre + cur, 0);
}

export default add;
