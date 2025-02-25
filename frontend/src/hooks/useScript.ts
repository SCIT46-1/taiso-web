// src/hooks/useScript.ts
import { useEffect, useState } from "react";

interface ScriptState {
  loaded: boolean;
  error: boolean;
}

const useScript = (src: string): ScriptState => {
  const [state, setState] = useState<ScriptState>({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    // 이미 스크립트가 로드된 경우 재사용
    let script = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      const onScriptLoad = () => setState({ loaded: true, error: false });
      const onScriptError = () => {
        script && script.remove();
        setState({ loaded: true, error: true });
      };
      script.addEventListener("load", onScriptLoad);
      script.addEventListener("error", onScriptError);
      document.body.appendChild(script);

      return () => {
        script?.removeEventListener("load", onScriptLoad);
        script?.removeEventListener("error", onScriptError);
      };
    } else {
      setState({ loaded: true, error: false });
    }
  }, [src]);

  return state;
};

export default useScript;
