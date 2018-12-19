﻿import React, { PureComponent } from 'react';
import { throttle } from 'lodash';
import Draggable from 'react-draggable';

import { PanelModel } from '../panel_model';

interface Props {
  isEditing: boolean;
  render: (height: number | 'inherit') => JSX.Element;
  panel: PanelModel;
}

interface State {
  editorHeight: number;
}

export class PanelResizer extends PureComponent<Props, State> {
  initialHeight: number = Math.floor(document.documentElement.scrollHeight * 0.4);
  prevEditorHeight: number;
  throttledChangeHeight: (height: number) => void;
  throttledResizeDone: () => void;

  constructor(props) {
    super(props);
    const { panel } = this.props;

    this.state = {
      editorHeight: this.initialHeight,
    };

    this.throttledChangeHeight = throttle(this.changeHeight, 20, { trailing: true });
    this.throttledResizeDone = throttle(() => {
      panel.resizeDone();
    }, 50);
  }

  get largestHeight() {
    return document.documentElement.scrollHeight * 0.9;
  }
  get smallestHeight() {
    return 100;
  }

  changeHeight = height => {
    const sh = this.smallestHeight;
    const lh = this.largestHeight;
    height = height < sh ? sh : height;
    height = height > lh ? lh : height;

    this.prevEditorHeight = this.state.editorHeight;
    this.setState({
      editorHeight: height,
    });
  };

  onDrag = (evt, data) => {
    const newHeight = this.state.editorHeight + data.y;
    this.throttledChangeHeight(newHeight);
    this.throttledResizeDone();
  };

  render() {
    const { render, isEditing } = this.props;
    const { editorHeight } = this.state;

    return (
      <>
        {render(isEditing ? editorHeight : 'inherit')}
        {isEditing && (
          <div className="panel-editor-container__resizer">
            <Draggable axis="y" grid={[100, 1]} onDrag={this.onDrag} position={{ x: 0, y: 0 }}>
              <div className="panel-editor-resizer">
                <div className="panel-editor-resizer__handle" />
              </div>
            </Draggable>
          </div>
        )}
      </>
    );
  }
}
