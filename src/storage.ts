import JSONCrush from 'jsoncrush';
import {useEffect, useState} from 'react';

abstract class Storage {
  abstract getItem(key: string): any | null;
  abstract setItem(key: string, value: any): void;
}

function useStorage<T>(
  StorageClass: typeof Storage,
  key: string,
  fallbackState: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    return StorageClass.prototype.getItem(key) ?? fallbackState;
  });
  useEffect(() => {
    StorageClass.prototype.setItem(key, value);
  }, [value, key, StorageClass.prototype]);

  return [value, setValue];
}

class LocalStorage extends Storage {
  getItem(key: string): any | null {
    const obj = localStorage.getItem(key);
    return obj != null ? JSON.parse(obj) : null;
  }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function objectToQueryString(obj: any): string {
  const crushed = JSONCrush.crush(JSON.stringify(obj));
  return encodeURIComponent(crushed);
}

function queryStringToObject<T>(queryString: string): T {
  const obj = JSONCrush.uncrush(queryString);
  return JSON.parse(obj);
}
class URLStorage extends Storage {
  getItem(key: string): any | null {
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get(key);
    return param != null ? queryStringToObject(param) : null;
  }

  setItem(key: string, value: any): void {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set(key, JSONCrush.crush(JSON.stringify(value)));
    window.history.pushState({}, '', newUrl.toString());
  }
}

function getStorageClass(): typeof Storage {
  if (URLStorage.prototype.getItem('cities')?.length > 0) {
    return URLStorage;
  }
  return LocalStorage;
}

export {
  objectToQueryString,
  queryStringToObject,
  Storage,
  LocalStorage,
  URLStorage,
  useStorage,
  getStorageClass,
};
