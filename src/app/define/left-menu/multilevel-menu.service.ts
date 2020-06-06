import { Injectable } from '@angular/core';
import { NavigationExtras } from '@angular/router';

export const CONSTANT = {
  PADDING_AT_START: true,
  DEFAULT_CLASS_NAME: `amml-container`,
  DEFAULT_LIST_CLASS_NAME: `amml-item`,
  SELECTED_LIST_CLASS_NAME: `selected-amml-item`,
  ACTIVE_ITEM_CLASS_NAME: `active-amml-item`,
  DISABLED_ITEM_CLASS_NAME: `disabled-amml-item`,
  DEFAULT_SELECTED_FONT_COLOR: `#1976d2`,
  DEFAULT_LIST_BACKGROUND_COLOR: `transparent`,
  DEFAULT_LIST_FONT_COLOR: `rgba(0,0,0,.87)`,
  ERROR_MESSAGE: `Invalid data for material Multilevel List Component`
};

export interface MultilevelNodes {
  id?: string;
  label: string;
  faIcon?: string;
  icon?: string;
  imageIcon?: string;
  svgIcon?: string;
  activeFaIcon?: string;
  activeIcon?: string;
  activeImageIcon?: string;
  activeSvgIcon?: string;
  hidden?: boolean;
  link?: string;
  externalRedirect?: boolean;
  data?: any;
  items?: MultilevelNodes[];
  onSelected?: Function;
  disabled?: boolean;
  expanded?: boolean;
  navigationExtras?: NavigationExtras;
}

export interface Configuration {
    classname?: string;
    paddingAtStart?: boolean;
    backgroundColor?: string;
    listBackgroundColor?: string;
    fontColor?: string;
    selectedListFontColor?: string;
    interfaceWithRoute?: boolean;
    collapseOnSelect?: boolean;
    highlightOnSelect?: boolean;
    rtlLayout?: boolean;
}

export interface BackgroundStyle {
    background: string;
}

export interface ListStyle {
    background: string;
    color: string;
}


@Injectable({
  providedIn: 'root'
})
export class MultilevelMenuService {
  foundLinkObject: MultilevelNodes;
  generateId(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 20; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  addRandomId(nodes: MultilevelNodes[]): void {
    nodes.forEach((node: MultilevelNodes) => {
      node.id = this.generateId();
      if (node.items !== undefined) {
        this.addRandomId(node.items);
      }
    });
  }
  recursiveCheckId(node: MultilevelNodes, nodeId: string): boolean {
    if (node.id === nodeId) {
      return true;
    } else {
      if (node.items !== undefined) {
        return node.items.some((nestedNode: MultilevelNodes) => {
          return this.recursiveCheckId(nestedNode, nodeId);
        });
      }
    }
  }
  recursiveCheckLink(nodes: MultilevelNodes[], link: string): void {
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
      const node = nodes[nodeIndex];
      for (const key in node) {
        if (node.hasOwnProperty(key)) {
          if (encodeURI(node.link) === link) {
            this.foundLinkObject = node;
          } else {
            if (node.items !== undefined) {
              this.recursiveCheckLink(node.items, link);
            }
          }
        }
      }
    }
  }
  getMatchedObjectByUrl(node: MultilevelNodes[], link: string): MultilevelNodes {
    this.recursiveCheckLink(node, link);
    return this.foundLinkObject;
  }
  // overrides key-value pipe's default reordering (by key) by implementing dummy comprarer function
  // https://angular.io/api/common/KeyValuePipe#description
  kvDummyComparerFn() {
    return 0;
  }
}
