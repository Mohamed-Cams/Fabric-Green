#!/usr/bin/env bash
# Emplacement: fabric/network/scripts/createChannel.sh
set -e

TENANT=${1:-dakar}
ARTIFACTS=../channel-artifacts

echo "===> Création du channel channel-$TENANT"

# Create channel
docker exec cli peer channel create \
  -o orderer.example.com:7050 \
  -c channel-$TENANT \
  -f /opt/artifacts/channel-$TENANT.tx \
  --outputBlock /opt/artifacts/channel-$TENANT.block \
  --tls \
  --cafile /opt/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "===> Channel créé avec succès"

echo "===> Join peers au channel"

# Join Ministry peer
docker exec cli peer channel join -b /opt/artifacts/channel-$TENANT.block

# Join Notary peer (adjust container name as needed)
docker exec -e CORE_PEER_LOCALMSPID=NotaryMSP \
  -e CORE_PEER_ADDRESS=peer0.notary.example.com:9051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/notary.example.com/users/Admin@notary.example.com/msp \
  cli peer channel join -b /opt/artifacts/channel-$TENANT.block

# Join Bank peer
docker exec -e CORE_PEER_LOCALMSPID=BankMSP \
  -e CORE_PEER_ADDRESS=peer0.bank.example.com:11051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/bank.example.com/users/Admin@bank.example.com/msp \
  cli peer channel join -b /opt/artifacts/channel-$TENANT.block

# Join Municipality peer
docker exec -e CORE_PEER_LOCALMSPID=MunicipalityMSP \
  -e CORE_PEER_ADDRESS=peer0.municipality.example.com:13051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/municipality.example.com/users/Admin@municipality.example.com/msp \
  cli peer channel join -b /opt/artifacts/channel-$TENANT.block

echo "===> Tous les peers ont rejoint le channel"

echo "===> Mise à jour des anchor peers"

# Update anchor peers for each organization
docker exec cli peer channel update \
  -o orderer.example.com:7050 \
  -c channel-$TENANT \
  -f /opt/artifacts/MinistryMSPanchors-$TENANT.tx \
  --tls \
  --cafile /opt/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "===> Channel channel-$TENANT créé et configuré avec succès"
echo "===> Vous pouvez maintenant déployer le chaincode avec ./deployChaincode.sh property $TENANT"
