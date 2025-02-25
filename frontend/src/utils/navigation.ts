let globalNavigate: ((path: string) => void) | null = null;

/** App 루트에서 네비게이터를 설정하기 위한 함수 */
export const setGlobalNavigate = (navigate: (path: string) => void) => {
  globalNavigate = navigate;
};

/** 네비게이션 수행 (글로벌 네비게이터가 없으면 window.location 사용) */
export const navigateTo = (path: string) => {
  if (globalNavigate) {
    globalNavigate(path);
  } else {
    window.location.href = path;
  }
};
