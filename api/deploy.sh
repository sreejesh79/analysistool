# npm run build:prod
# scp -i ~/.ssh/looklookat-prod -r dist/ looklookat-prod@40.112.168.91:/home/looklookat-prod
# scp -i ~/.ssh/looklookat-prod  package.json looklookat-prod@40.112.168.91:/home/looklookat-prod
# ssh -i ~/.ssh/looklookat-prod looklookat-prod@40.112.168.91 '
# cd /var/www/analytics_tool
# sudo rm -rf /var/www/analytics_tool/dist || true
# sudo mv /home/looklookat-prod/dist .
# sudo rm  /var/www/analytics_tool/package.json || true
# sudo mv /home/looklookat-prod/package.json .
# echo "files successfully copied"
# echo "calling npm install"
# npm install
# echo "successfully deployed the changes."
# exit'

npm run build:prod
scp -i ~/.ssh/looklookapiv3.pem -r dist/* ubuntu@18.206.23.79:~/api.looklook-analysis.com/dist
# ssh -i ~/.ssh/looklookapiv3.pem ubuntu@18.206.23.79
echo "successfully deployed the changes."