// https://www.weather.gov/gis/cloudgiswebservices

// https://opengeo.ncep.noaa.gov/geoserver/www/index.html

//#region types

import esri = __esri;

//#endregion

//#region modules

import { watch } from '@arcgis/core/core/reactiveUtils';
import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import Panel from './Panel';
import { tsx } from '@arcgis/core/widgets/support/widget';
import WeatherAdvisories from './WeatherAdvisories';
import WeatherLayers from './WeatherLayers';
import Cookies from 'js-cookie';
import { applicationSettings } from '../app-config';

//#endregion

//#region constants

const COOKIE = 'money-tides-weather-notice';

//#endregion

@subclass('WeatherPanel')
export default class WeatherPanel extends Panel {
  //#region lifecycle

  constructor(properties?: esri.WidgetProperties) {
    super(properties);

    this.addHandles(
      watch(
        (): boolean => this.visible,
        (visible: boolean): void => {
          if (!visible) {
            this.weatherLayers.clear();

            this.weatherAdvisories.clear();
          }
        },
      ),
    );
  }

  //#endregion

  //#region public properties
  //#endregion

  //#region private properties

  private weatherAdvisories!: WeatherAdvisories;

  private weatherLayers!: WeatherLayers;

  //#endregion

  //#region private methods
  //#endregion

  //#region render

  override render(): tsx.JSX.Element {
    return (
      <calcite-panel heading="Weather" scale={applicationSettings.scale}>
        {this.closeAction()}
        {this.renderNotice()}
        <calcite-block afterCreate={this.weatherLayersAfterCreate.bind(this)}></calcite-block>
        <calcite-block afterCreate={this.weatherAdvisoriesAfterCreate.bind(this)}></calcite-block>
      </calcite-panel>
    );
  }

  private renderNotice(): tsx.JSX.Element | null {
    if (Cookies.get(COOKIE)) return null;

    return (
      <div style="padding: 0.25rem;">
        <calcite-notice
          closable
          open
          scale={applicationSettings.scale}
          style="width: 100%;"
          afterCreate={(notice: HTMLCalciteNoticeElement): void => {
            notice.addEventListener('calciteNoticeClose', (): void => {
              Cookies.set(COOKIE, 'noticed', { expires: 14 });

              this.scheduleRender();
            });
          }}
        >
          <div slot="message">Weather layers and advisories are current and do not reflect selected tide date.</div>
        </calcite-notice>
      </div>
    );
  }

  private weatherAdvisoriesAfterCreate(container: HTMLDivElement): void {
    this.weatherAdvisories = new WeatherAdvisories({ container });
  }

  private weatherLayersAfterCreate(container: HTMLDivElement): void {
    this.weatherLayers = new WeatherLayers({ container });
  }

  //#endregion
}
