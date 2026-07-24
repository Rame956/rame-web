import RameFetch from '$lib/apps/ramefetch.svelte'
import mdview from '$lib/apps/mdview.svelte';
import LinksFetch from '$lib/apps/linksfetch.svelte';
import welcomeFile from '$lib/files/text_files/Welcome.md?raw';
import type { Component } from 'svelte';

export type app = {
    id: string;
    name: string;
    title: string;
    component: Component<any>;
    width: number;
    height: number;
    props?: Record<string, unknown>;
};

export const apps: app[] = [
    {
        id: "ramefetch",
        name: "RameFetch",
        title: "~: ramefetch",
        component: RameFetch,
        width: 800,
        height: 450
    },

    {
        id: "welcome",
        name: "Welcome",
        title: "mdview: ~/Welcome.md",
        component: mdview,
        width: 900,
        height: 490,

        props: {
            file: {
                name: "~/Welcome.md",
                text: welcomeFile
            }
        }
    },

    {
        id: "links",
        name: "LinksFetch",
        title: "~: linksfetch",
        component: LinksFetch,
        width: 800,
        height: 500
    }
];
