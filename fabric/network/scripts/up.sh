#!/usr/bin/env bash
# Emplacement: fabric/network/scripts/up.sh
set -e

echo "===> Démarrage du réseau Hyperledger Fabric GreenLand"
cd ..
docker-compose -f docker-compose.yaml up -d

echo "===> Attente du démarrage des conteneurs (10 secondes)..."
sleep 10

echo "===> Réseau Fabric démarré avec succès"
echo "===> Vérification de l'état des conteneurs:"
docker-compose ps

echo ""
echo "===> Prochaines étapes:"
echo "    1. Créer les canaux: ./createChannel.sh dakar"
echo "    2. Déployer le chaincode: ./deployChaincode.sh property dakar"
