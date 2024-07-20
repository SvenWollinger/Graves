import { world, Player, WeatherType } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import Utilities from "./utilities";
import Debug from "./debug";
import Config from "./config"

world.gameRules.keepInventory = true;

world.afterEvents.entityDie.subscribe((event) => {
  if (!(event.deadEntity instanceof Player)) return;

  let player = event.deadEntity;
  let grave = player.dimension.spawnEntity("graves:grave", player.location);
  grave.nameTag = `${player.name}'s Grave`;
  Utilities.getEntityHealthComponent(grave).setCurrentValue(1);

  let playerInventory = Utilities.getEntityInventoryComponent(player);
  let graveInventory = Utilities.getEntityInventoryComponent(grave);

  for (let i = 0; i < playerInventory.inventorySize; i++) {
    playerInventory.container?.transferItem(i, graveInventory.container!!);
  }
});

if (Config.debug) Debug.initDebug();