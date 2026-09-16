import type { ComponentType } from 'react';
import type { ArtProps, ObjectKind } from './types';
import { Wall } from './objects/Wall';
import { Floor } from './objects/Floor';
import { Baseboard } from './objects/Baseboard';
import { Outside } from './objects/Outside';
import { Window } from './objects/Window';
import { Blinds } from './objects/Blinds';
import { BulletinBoard } from './objects/BulletinBoard';
import { BoardBlueprint } from './objects/BoardBlueprint';
import { BoardReminder } from './objects/BoardReminder';
import { BoardSmile } from './objects/BoardSmile';
import { BoardPhoto } from './objects/BoardPhoto';
import { BoardSmallNote } from './objects/BoardSmallNote';
import { Clock } from './objects/Clock';
import { Shelf } from './objects/Shelf';
import { Binders } from './objects/Binders';
import { ShelfPlant } from './objects/ShelfPlant';
import { FilingCabinet } from './objects/FilingCabinet';
import { Outlet } from './objects/Outlet';
import { Workbench } from './objects/Workbench';
import { DeskPedestal } from './objects/DeskPedestal';
import { DrawerTop } from './objects/DrawerTop';
import { DrawerBottom } from './objects/DrawerBottom';
import { DeskLamp } from './objects/DeskLamp';
import { DeskPlant } from './objects/DeskPlant';
import { CoffeeMug } from './objects/CoffeeMug';
import { SolderingStation } from './objects/SolderingStation';
import { TapeRoll } from './objects/TapeRoll';
import { PartsOrganizer } from './objects/PartsOrganizer';
import { StorageBoxes } from './objects/StorageBoxes';
import { PencilCup } from './objects/PencilCup';
import { DeskPaper } from './objects/DeskPaper';
import { Screwdriver } from './objects/Screwdriver';
import { LooseHardware } from './objects/LooseHardware';
import { ToolCart } from './objects/ToolCart';
import { TestMeter } from './objects/TestMeter';
import { CartToolCup } from './objects/CartToolCup';
import { CartBox } from './objects/CartBox';
import { CableReel } from './objects/CableReel';
import { FloorBox } from './objects/FloorBox';
import { AirDust } from './objects/AirDust';

export const ART: Record<ObjectKind, ComponentType<ArtProps>> = {
  'wall': Wall,
  'floor': Floor,
  'baseboard': Baseboard,
  'outside': Outside,
  'window': Window,
  'blinds': Blinds,
  'bulletin-board': BulletinBoard,
  'board-blueprint': BoardBlueprint,
  'board-reminder': BoardReminder,
  'board-smile': BoardSmile,
  'board-photo': BoardPhoto,
  'board-small-note': BoardSmallNote,
  'clock': Clock,
  'shelf': Shelf,
  'binders': Binders,
  'shelf-plant': ShelfPlant,
  'filing-cabinet': FilingCabinet,
  'outlet': Outlet,
  'workbench': Workbench,
  'desk-pedestal': DeskPedestal,
  'drawer-top': DrawerTop,
  'drawer-bottom': DrawerBottom,
  'desk-lamp': DeskLamp,
  'desk-plant': DeskPlant,
  'coffee-mug': CoffeeMug,
  'soldering-station': SolderingStation,
  'tape-roll': TapeRoll,
  'parts-organizer': PartsOrganizer,
  'storage-boxes': StorageBoxes,
  'pencil-cup': PencilCup,
  'desk-paper': DeskPaper,
  'screwdriver': Screwdriver,
  'loose-hardware': LooseHardware,
  'tool-cart': ToolCart,
  'test-meter': TestMeter,
  'cart-tool-cup': CartToolCup,
  'cart-box': CartBox,
  'cable-reel': CableReel,
  'floor-box': FloorBox,
  'air-dust': AirDust,
};
