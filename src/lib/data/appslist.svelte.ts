import RameFetch from '$lib/apps/ramefetch.svelte'
import mdview from '$lib/apps/mdview.svelte';
import LinksFetch from '$lib/apps/linksfetch.svelte';
import welcomeFile from '$lib/files/text_files/Welcome.md?raw';
import welcomeFileEn from '$lib/files/text_files/Welcome_en.md?raw';
import type { Component } from 'svelte';

export type App = {
    id: string;
    name: string;
    title: string;
    icon?: string;
    description: string;
    component: Component<any>;
    width: number;
    height: number;
    props?: Record<string, unknown>;
};

export function appsList(locale: "ru" | "en"): App[] {
  return [
    {
      id: "ramefetch",
      name: "RameFetch",
      title: "~: ramefetch",
      icon: '/icons/ramefetchicon.svg',
      description: locale === 'ru' ? 'Информация обо мне' : 'About me',
      component: RameFetch,
      width: 800,
      height: 450
    },

    {
      id: "welcome",
      name: "Welcome",
      title: "mdview: ~/Welcome.md",
      icon: '/icons/welcomeicon.svg',
      description: locale === 'ru' ? 'Приветственный файл' : 'Welcome file',
      component: mdview,
      width: 900,
      height: 490,

      props: {
        file: {
          name: "~/Welcome.md",
          text: locale === 'ru' ? welcomeFile : welcomeFileEn
        }
      }
    },

    {
      id: "links",
      name: "LinksFetch",
      title: "~: linksfetch",
      icon: '/icons/linksfetchicon.svg',
      description: locale === 'ru' ? 'Разные ссылки и контакты' : 'Links and contacts',
      component: LinksFetch,
      width: 800,
      height: 500
    },
  ];

}
