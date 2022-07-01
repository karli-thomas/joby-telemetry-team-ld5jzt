import { Component, OnInit } from '@angular/core';
import { Subject, interval } from 'rxjs';
import random from 'random';
import * as geolib from 'geolib';

/**
 * This dashboard displays real-time data about the position of
 * our fleet of airplanes.
 */
@Component({
  selector: 'planes-dashboard',
  templateUrl: `planes-dashboard.component.html`,
  styleUrls: [`planes-dashboard.component.scss`],
})
export class PlanesDashboardComponent implements OnInit {
  /** This is a stream of fake position updates from a fleet of airplanes. */
  public airplanePositionsService$ = new Subject<IAirplanePosition>();

  /** Used by airplanePositionsService$ to hold the fake airplane data. */
  private currentFleetPositions: Array<IAirplanePosition> = [];

  /** This is the data structure currently projected into the template. */
  public airplanePositions: IAirplanePosition[] = [];

  /**
   * Inits the Angular component: Starts up our fake data source, 
   * then subscribes to fleet data updates so it can be projected into the template.
   */
  ngOnInit() {
    // Start our fake data stream of airplane position updates.
    this.initFakeAirplaneData();
    this.startUpdatingFakeData();

    // Subscribe to the data stream of airplane position updates.
    this.airplanePositionsService$.subscribe((plane) => {
      this.airplanePositions.push(plane);
    });
  }

  /** Converts lat & long decimal values to lat/long strings for the template */
  public formatLatLong(degrees: number): string {
    return geolib.decimalToSexagesimal(degrees);
  }

  /** Initializes an array of elements representing airplanes to be tracked. */
  private initFakeAirplaneData(): void {
    const MADISON_LAT = 43.0850508;
    const MADISON_LONG = -89.4415254;
    // Create a starting point for a number of planes around the scenic Great Lakes.
    ['alpha', 'bravo', 'charlie', 'delta'].forEach((id) => {
      this.currentFleetPositions.push({
        airplane_id: id,
        // Hone this in to N. America
        latitude_deg: MADISON_LAT + random.float(-1, 4),
        longitude_deg: MADISON_LONG + random.float(-1, 5),
        altitude_m: random.float(1000, 5000),
        heading_deg: random.float(0, 360),
        speed_kph: random.float(100, 200),
      });
    });
  }

  /**
   * Updates each fake airplane's location once per second.
   * Each plane flies in a straight line based on its heading and velocity.
   */
  private startUpdatingFakeData(): void {
    interval(1000).subscribe(_ => { // "_" means the function gets a value but we ignore it.
      this.currentFleetPositions.forEach((plane) => {
        const KPH_TO_MPS_CONVERSION = 1000 / 3600;
        const distance = plane.speed_kph * KPH_TO_MPS_CONVERSION; // Distance = Velocity * Time

        // Compute a new location for this aircraft
        const newPosition = geolib.computeDestinationPoint(
          {
            longitude: plane.longitude_deg,
            latitude: plane.latitude_deg,
          },
          distance,
          plane.heading_deg
        );

        plane.latitude_deg = newPosition.latitude;
        plane.longitude_deg = newPosition.longitude;
      });

      // Emit the new positions to the stream
      this.currentFleetPositions.forEach((p) =>
        this.airplanePositionsService$.next({ ...p })
      );
    });
  }
}

/** Describes one sample of position data for a single airplane. */
interface IAirplanePosition {
  airplane_id: string;
  latitude_deg: number;
  longitude_deg: number;
  altitude_m: number;
  heading_deg: number;
  speed_kph: number;
}
