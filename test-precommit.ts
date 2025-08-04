// 这个文件包含故意的lint错误来测试pre-commit hooks
export function testFunction(): string {
  const badVar = '应该使用const';
  console.log(badVar);
  return badVar;
}
