import { system, world, WeatherType, Player, ItemStack, ItemType } from "@minecraft/server"
import { ModalFormData, ActionFormData } from "@minecraft/server-ui"
import Utilities from "./utilities";
import Config from "./config";

export default class Debug {
    static initDebug() {
        function showDebugConfig(player: Player) {
            const modal = new ModalFormData()
                .title("Debug Settings")
                .toggle("Show Coordinates", world.gameRules.showCoordinates)
                .toggle("doDaylightCycle", world.gameRules.doDayLightCycle)
                .toggle("doWeatherCycle", world.gameRules.doWeatherCycle)
                .toggle("doMobSpawning", world.gameRules.doMobSpawning);

            modal.show(player).then((response) => {
                if (response.canceled) return
                world.gameRules.showCoordinates = response.formValues[0] as boolean
                world.gameRules.doDayLightCycle = response.formValues[1] as boolean
                world.gameRules.doWeatherCycle = response.formValues[2] as boolean
                world.gameRules.doMobSpawning = response.formValues[3] as boolean
            });
        }

        function showTeleportUtils(player: Player) {
            const modal = new ModalFormData()
                .title("Teleport Utils")
                .toggle("Relative")
                .textField("X", "0")
                .textField("Y", "0")
                .textField("Z", "0")
                .submitButton("Teleport");

            modal.show(player).then((response) => {
                if (response.canceled) return;

                const relative = response.formValues[0] as boolean;
                const newX = Number(response.formValues[1]);
                const newY = Number(response.formValues[2]);
                const newZ = Number(response.formValues[3]);

                let { x, y, z } = relative ? player.location : { x: 0, y: 0, z: 0 };
                player.sendMessage(`Chosen position to add: ${x} ${y} ${z}`)
                x += newX;
                y += newY;
                z += newZ;
                player.teleport({ x: x, y: y, z: z })
                player.sendMessage(`Adding: ${newX} ${newY} ${newZ}`)
                player.sendMessage(`Result: ${x} ${y} ${z}`)
            });
        }

        function showDebugUtils(player: Player) {
            const form = new ActionFormData()
                .title("Debug Utils")
                .button("Set time and weather")
                .button("Clear Entities")
                .button("Teleport up")
                .button("Teleport to 0/0/0")
                .button("Teleport Utils");

            form.show(player).then((response) => {
                switch (response.selection) {
                    case 0: {
                        player.dimension.setWeather(WeatherType.Clear);
                        world.setTimeOfDay(6_000);
                        break;
                    }
                    case 1: {
                        player.dimension.getEntities().forEach((entity) => {
                            if (entity instanceof Player) return;
                            entity.remove();
                        })
                        break;
                    }
                    case 2: {
                        player.runCommandAsync("tp @s ~ ~25 ~");
                        break;
                    }
                    case 3: {
                        player.runCommandAsync("tp @s 0 ~ 0");
                        break;
                    }
                    case 4: {
                        showTeleportUtils(player);
                        break;
                    }
                }
            });
        }

        world.beforeEvents.itemUse.subscribe((event) => {
            system.run(() => {
                let debug = event.itemStack.getDynamicProperty(Config.debugItemKey) as string;
                switch (debug) {
                    case Config.debugConfigId: {
                        showDebugConfig(event.source as Player);
                        break;
                    }
                    case Config.debugUtilsId: {
                        showDebugUtils(event.source as Player);
                        break;
                    }
                }
            });
        })

        world.beforeEvents.chatSend.subscribe((event) => {
            if (!event.message.startsWith("!")) return;
            event.cancel = true;

            let cmd = event.message.substring(1, event.message.length);
            system.run(() => {
                switch (cmd) {
                    case "debug": {
                        Utilities.giveItem(event.sender, "minecraft:diamond_sword", "Debug Config", Config.debugItemKey, Config.debugConfigId);
                        Utilities.giveItem(event.sender, "minecraft:netherite_sword", "Debug Utils", Config.debugItemKey, Config.debugUtilsId);
                        break;
                    }
                }
            })
        });
    }
}
