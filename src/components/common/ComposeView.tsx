import * as Preact from 'preact';

import { BoundRenderCallback, DestroyCallback } from 'diagramMaker/service/ConfigService';

interface ComposeViewProps {
  renderCallback: BoundRenderCallback;
  destroyCallback: DestroyCallback;
}

export default class ComposeView extends Preact.Component<ComposeViewProps> {

  private diagramMakerContainer: HTMLElement | undefined;
  private consumerContainer: HTMLElement | undefined | void;

  public render() {
    return (
      <div
        className="dm-content"
        ref={el => this.diagramMakerContainer = el}
      />
    );
  }

  public componentDidMount = () => {
    this.rerenderConsumerNode();
  }

  public componentDidUpdate = () => {
    this.rerenderConsumerNode();
  }
  public componentWillUnmount = () => {
    // diagramMakerContainer is always available because this is called after render
    this.props.destroyCallback(this.diagramMakerContainer as HTMLElement, this.consumerContainer);
  }

  private rerenderConsumerNode = () => {
    // diagramMakerContainer is always available because this is called after render
    this.consumerContainer =
      this.props.renderCallback(this.diagramMakerContainer as HTMLElement, this.consumerContainer);
  }
}
