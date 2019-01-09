import React from 'react';
import BesugoComponent from 'Besugo';

import EndFooter from 'partials/EndFooter';
import MoreArrow from 'partials/MoreArrow';
import SVGElements from 'partials/SVGElements';
import TopHeader from 'partials/TopHeader';

export default class Plan extends BesugoComponent {
  static config = {
    tag: 'Plan',
    categories: [ 'plan', 'plan-pt' ],
  }

  static extraProps(props, xplaceholder) {
    const percs = xplaceholder.getChildren('Perc');
    props.percs = percs.map(perc => (perc.text()));
  }

  static buildContainer(parserUtils) {
    const container = parserUtils.createNode('li');
    parserUtils.setAttribute(container, 'class', 'plan');
    return container;
  }

  getData() {
    if (this.isPreview()) {
      const { entry } = this.props;
      const data = entry.getIn([ 'data' ]);
      const locale = this.props.collection
        .getIn([ 'fields' ])
        .filter(field => (field.getIn([ 'name' ]) === 'i18nlanguage'))
        .get(0)
        .getIn([ 'default' ]);

      return {
        name: data.getIn([ 'name' ]),
        kind: data.getIn([ 'kind' ]),
        icon: data.getIn([ 'icon' ]),
        description: data.getIn([ 'description' ]),
        rate: data.getIn([ 'price', 'rate' ]),
        per: data.getIn([ 'price', 'per' ]),
        perstring: (locale === 'pt') ? 'Por %s' : 'Per %s',
        button: data.getIn([ 'button' ]),
        percs: (data.getIn([ 'percs' ]) || []).map(perc => perc.getIn([ 'perc' ])),
      };
    }

    return this.props;
  }

  buildPercs(data) {
    return !data.percs.length && !data.percs.size ? null : (
      <div className="plan__percs__wrapper">
        { data.percs.map(perc => (
          <div className="plan__perc" key={ `perc-${perc}` }>
            { perc }
          </div>
        )) }
      </div>
    );
  }

  renderBlock() {
    const data = this.getData();

    return (
      <div className={ `plan__wrapper plan-${data.kind}` }>
        <div className="plan__container">
          { data.icon && (
            <div className={ `icon icon-${data.icon}` } />
          ) }

          <h3 className="plan__name">
            { data.name }
          </h3>

          { data.rate && (
            <div className="plan__price-rate">
              {data.rate}
              <span className="plan__price-rate__euro">€</span>
            </div>
          ) }

          { data.per && (
            <div className="plan__price-per">
              { data.perstring.replace('%s', data.per) }
            </div>
          ) }

          { data.button && (
            <MoreArrow
              label={ data.button }
              className="plan__button"
              selNext="#reservation"
            />
          ) }

          { data.description && (
            <div className="plan__description">
              { data.description }
            </div>
          ) }

          { this.buildPercs(data) }
        </div>
      </div>
    );
  }

  renderPreview() {
    const data = this.getData();

    return (
      <div id="cmsPreview">
        <SVGElements />
        <TopHeader />
        <div className="page-main page-main--simple">
          <section className={ `plans__${data.kind}` }>
            <div className="plans__content">
              <ul className="plans__list">
                <li className="plan">
                  { this.renderBlock() }
                </li>
              </ul>
            </div>
          </section>
        </div>
        <EndFooter />
      </div>
    );
  }
}
