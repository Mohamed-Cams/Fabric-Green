#!/usr/bin/env bash
# Emplacement: fabric/network/scripts/generate.sh
set -e

CRYPTO_DIR=../organizations
ARTIFACTS_DIR=../channel-artifacts
CONFIG_DIR=../../config

echo "===> Nettoyage des anciennes configurations"
rm -rf $CRYPTO_DIR $ARTIFACTS_DIR
mkdir -p $CRYPTO_DIR $ARTIFACTS_DIR

echo "===> Génération des certificats avec cryptogen"
cryptogen generate --config=$CONFIG_DIR/crypto-config.yaml --output=$CRYPTO_DIR

echo "===> Génération du bloc genesis et des transactions de channel"
export FABRIC_CFG_PATH=$CONFIG_DIR

# Genesis block for orderer
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock $ARTIFACTS_DIR/genesis.block

# Channel creation transactions
echo "===> Génération des transactions pour les canaux (Dakar, Thies)"
configtxgen -profile DakarChannel -outputCreateChannelTx $ARTIFACTS_DIR/channel-dakar.tx -channelID channel-dakar
configtxgen -profile ThiesChannel -outputCreateChannelTx $ARTIFACTS_DIR/channel-thies.tx -channelID channel-thies

# Anchor peer updates
echo "===> Génération des mises à jour des anchor peers"
configtxgen -profile DakarChannel -outputAnchorPeersUpdate $ARTIFACTS_DIR/MinistryMSPanchors-dakar.tx -channelID channel-dakar -asOrg MinistryMSP
configtxgen -profile DakarChannel -outputAnchorPeersUpdate $ARTIFACTS_DIR/NotaryMSPanchors-dakar.tx -channelID channel-dakar -asOrg NotaryMSP
configtxgen -profile DakarChannel -outputAnchorPeersUpdate $ARTIFACTS_DIR/BankMSPanchors-dakar.tx -channelID channel-dakar -asOrg BankMSP
configtxgen -profile DakarChannel -outputAnchorPeersUpdate $ARTIFACTS_DIR/MunicipalityMSPanchors-dakar.tx -channelID channel-dakar -asOrg MunicipalityMSP

echo "===> Terminé: certificats et artefacts générés avec succès"
echo "===> Vous pouvez maintenant démarrer le réseau avec ./up.sh"
