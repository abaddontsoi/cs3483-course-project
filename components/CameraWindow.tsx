import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

export class CameraWindow extends React.PureComponent {
    containerEl: HTMLDivElement;
    externalWindow: Window | null;
    children: ReactNode

    constructor(props: {
        children: ReactNode
    }) {
        super(props)
        this.children = props.children;
        this.containerEl = document.createElement('div');
        this.externalWindow = null;
    }

    render() {
        return createPortal(this.children, this.containerEl);
    }

    componentDidMount() {
        this.externalWindow = window.open('', '', 'width=700,height=600,left=200,top=200');
        if (this.externalWindow == null) {
            return;
        }
        this.externalWindow.document.body.appendChild(this.containerEl);
    }

    componentWillUnmount() {
        if (this.externalWindow == null) {
            return;
        }
        this.externalWindow.close();
    }
}
