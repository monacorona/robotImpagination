import React, { Component } from 'react';

// Native base for nice prestyled components
import {
  Button,
  Header,
  Container,
  Title,
  Content,
  Spinner,
} from 'native-base';

import Dataset  from 'impagination';
import RobotItem from './RobotItem';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataset: null,
      store: null,
    };
  }

  /**
   * Create a new impagination dataset when the component mounts and
   * set the intial readOffset to 0 to fetch data.
   *
   * @method setupImpagination
   */
  setupImpagination() {
    let _this = this;

    let dataset = new Dataset({
      pageSize: 15,
      loadHorizon: 15,

      // Anytime there's a new store emitted, we want to set that on
      // the componets local state.
      observe(store) {
        _this.setState({store});
      },

      // Where to fetch the data from.
      fetch(pageOffset, pageSize, stats) {
        return fetch(`https://serene-beach-38011.herokuapp.com/api/faker?page=${pageOffset + 1}&per_page=${pageSize}`)
          .then(response => response.json())
          .then(data => data)
          .catch((error) => {
            console.error(error);
          });
      }
    });

    this.setState({dataset: dataset});

    dataset.setReadOffset(0);
  }

  componentWillMount() {
    this.setupImpagination();
  }

  /**
   * Render each item in the impagination store. If the record is
   * pending we should show a loading spinner.
   *
   * @method renderItem
   */
  renderItem() {
    return this.state.store.map(record => {
      if(record.isPending && !record.isSettled) {
        return <Spinner color="#00C497" key={Math.random()}/>;
      }

      return (
        <RobotItem record={record} key={record.content.id} />
      );
    });
  }

  /**
   * Based on scroll position determine which card is in the current
   * viewport. From there you can set the impagination readOffset
   * equal to the current visibile card.
   *
   * @method setCurrentReadOffset
   */
  setCurrentReadOffset(event) {
    let itemHeight = 402;
    let currentOffset = Math.floor(event.nativeEvent.contentOffset.y);
    let currentItemIndex = Math.ceil(currentOffset / itemHeight);

    this.state.dataset.setReadOffset(currentItemIndex);
  }

  render() {
    return (
      <Container>
        <Header>
          <Title>Impagination.js</Title>
        </Header>
        <Content scrollEventThrottle={300} onScroll={this.setCurrentReadOffset.bind(this)} removeClippedSubviews={true}>
          {this.renderItem()}
        </Content>
      </Container>
    );
  }
}
