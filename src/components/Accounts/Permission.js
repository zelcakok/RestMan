class Permission {
  static PAGES = {
    "ADMIN" : ["TABLE", "ORDER", "COOK", "SERVE", "STATISTICS", "CONFIG"],
    "MANAGER" : ["TABLE", "ORDER", "COOK", "SERVE","STATISTICS"],
    "WAITER" : ["ORDER", "SERVE"],
    "COOK" : ["COOK"]
  }

  static pageControl(pages, pageName){
    if(pages==null) return false;
    return pages.join("_").indexOf(pageName) !== -1;
  }

  static getPage(App, USER_TAG){
    return Permission.PAGES[USER_TAG];
  }
}
export default Permission;
