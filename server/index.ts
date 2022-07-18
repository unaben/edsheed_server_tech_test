import {
  ProcessedContributorData,
  RawContributorData,
} from '../types/contributors';

import { PagedResults } from '../types/paging';

const express = require('express');
const app = express();
const port = 4501;

const fs = require('fs');

const rawContributorData = fs.readFileSync('data/contributors.json', 'utf-8');
const data = JSON.parse(rawContributorData);

const processContributor = (
  contributor: RawContributorData
): ProcessedContributorData => {
  return {
    author: contributor.author,
    total_contributions: contributor.total_contributions,
    contribution_range: {
      start: new Date(contributor.first_contribution),
      end: new Date(contributor.last_contribution),
    },
    clans_contributed_to: contributor.clans_contributed_to.split(' '),
  };
};

const processData = (
  contributors: RawContributorData[]
): ProcessedContributorData[] => {
  return contributors.map(processContributor);
};
const contributorsData = processData(data);

app.get('/contributors', (req: any, res: any) => {
  const page: number = req.query.page ? parseInt(req.query.page) : 0;
  const page_size: number = req.query.page_size
    ? parseInt(req.query.page_size)
    : 10;
  const startIndex: number = (page - 1) * page_size;
  const endIndex: number = page * page_size;

  const paginatedResult: PagedResults<ProcessedContributorData> = {
    items: contributorsData.slice(startIndex, endIndex),
    total: page_size,
  };

  try {
    res.send(paginatedResult);
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(port);

console.log(`App listening on http://localhost:${port}`);
